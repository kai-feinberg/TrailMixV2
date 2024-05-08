// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import { AutomationCompatibleInterface } from "@chainlink/contracts/src/v0.8/automation/interfaces/AutomationCompatibleInterface.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/security/ReentrancyGuard.sol";

error NotContractOwner(); // Error for when the caller is not the contract owner

import { TrailMix } from "./TrailMix.sol"; // Import TrailMix contract
import { ITrailMix } from "./ITrailMix.sol"; // Import ITrailMix interface

contract TrailMixManager is AutomationCompatibleInterface, ReentrancyGuard {
	//array storing all active strategies
	address[] public activeStrategies;
	// mapping to store index of strategy in activeStrategies array
	mapping(address => uint256) private strategyIndex;

	//mapping for quick lookup for if a strategy is active
	mapping(address => bool) public isActiveStrategy;

	// Mapping from user address to array of deployed TrailMix contract addresses
	mapping(address => address[]) public userContracts;

	// Event to emit when a new TrailMix contract is deployed
	event ContractDeployed(
		address indexed creator,
		address contractAddress,
		uint256 timestamp
	);

	event FundsDeposited(
		address indexed creator,
		address indexed strategy,
		uint256 depositPrice,
		uint256 amount,
		address token,
		uint256 timestamp
	);
	event FundsWithdrawn(
		address indexed creator,
		address indexed strategy,
		uint256 amount,
		address token,
		uint256 timestamp
	);
	event ThresholdUpdated(
		address indexed strategy,
		uint256 oldThreshold,
		uint256 newThreshold,
		uint256 timestamp
	);
	event SwapExecuted(
		address indexed strategy,
		address indexed creator,
		uint256 amountIn,
		uint256 amountOut,
		address tokenIn,
		address tokenOut,
		uint256 timestamp
	);

	// Function to deploy a new TrailMix contract
	function deployTrailMix(
		address _erc20Token,
		address _stablecoin,
		address _uniswapRouter,
		address _uniswapPool,
		address _uniswapOracle,
		uint256 _trailAmount,
		uint256 _granularity,
		uint24 _poolFee
	) public {
		// Deploy the TrailMix contract
		TrailMix newTrailMix = new TrailMix(
			address(this), // The TrailMixManager contract address
			msg.sender, // The user becomes the creator of the TrailMix contract
			_erc20Token,
			_stablecoin,
			_uniswapRouter,
			_uniswapPool,
			_uniswapOracle,
			_trailAmount,
			_granularity,
			_poolFee
		);

		// Store the contract address in the userContracts mapping
		userContracts[msg.sender].push(address(newTrailMix));
		activeStrategies.push(address(newTrailMix));
		isActiveStrategy[address(newTrailMix)] = true;
		strategyIndex[address(newTrailMix)] = activeStrategies.length - 1;

		// Emit an event for the deployment
		emit ContractDeployed(
			msg.sender,
			address(newTrailMix),
			block.timestamp
		);
	}

	// IMPLEMENT DEPOSIT AND WITHDRAW FUNCTIONS
	function deposit(
		address _strategy,
		uint256 _amount,
		uint256 _tslThreshold
	) public {
		if (ITrailMix(_strategy).getCreator() != msg.sender) {
			revert NotContractOwner();
		}

		// Get the ERC20 token address from the TrailMix contract
		address erc20TokenAddress = ITrailMix(_strategy).getERC20TokenAddress();
		//transfer funds from user to the manager contract
		IERC20(erc20TokenAddress).transferFrom(
			msg.sender,
			address(this),
			_amount
		);

		// approve strategy to spend the funds and call deposit
		IERC20(erc20TokenAddress).approve(_strategy, _amount);
		ITrailMix(_strategy).deposit(_amount, _tslThreshold);

		// Emit an event for the deposit
		emit FundsDeposited(
			msg.sender,
			_strategy,
			ITrailMix(_strategy).getExactPrice(),
			_amount,
			ITrailMix(_strategy).getERC20TokenAddress(),
			block.timestamp
		);
	}

	function withdraw(address _strategy, address _token) public nonReentrant {
		// Withdraw the user's funds from the TrailMix contract
		if (ITrailMix(_strategy).getCreator() != msg.sender) {
			revert NotContractOwner();
		}
		ITrailMix(_strategy).withdraw(_token);
		removeStrategy(_strategy);
	}

	function toggleSlippageProtection(address _strategy) public {
		if (ITrailMix(_strategy).getCreator() != msg.sender) {
			revert NotContractOwner();
		}
		ITrailMix(_strategy).toggleSlippageProtection();
	}

	// Remove a strategy
	function removeStrategy(address strategy) private {
		require(strategy != address(0), "Invalid address");
		require(isActiveStrategy[strategy], "Strategy not active");

		isActiveStrategy[strategy] = false;

		// Move the last element into the place to delete
		uint256 index = strategyIndex[strategy];
		address lastStrategy = activeStrategies[activeStrategies.length - 1];
		activeStrategies[index] = lastStrategy;
		strategyIndex[lastStrategy] = index;
		activeStrategies.pop();

		// Clean up
		delete strategyIndex[strategy];
	}

	/**
	 * @notice Checks if upkeep is needed based on TSL conditions.COMPUTED OFF-CHAIN
	 * @dev Part of the Chainlink automation interface.
	 * @param 'checkData' Not used in this implementation.
	 * @return upkeepNeeded Boolean flag indicating if upkeep is needed.
	 * @return performData Encoded data on what action to perform during upkeep.
	 */
	function checkUpkeep(
		bytes calldata /*checkData*/
	) external view returns (bool upkeepNeeded, bytes memory performData) {
		for (uint256 i = 0; i < activeStrategies.length; i++) {
			(bool sell, bool update, uint256 newThreshold) = ITrailMix(
				activeStrategies[i]
			).checkUpkeepNeeded();

			if (sell) {
				// Prioritize swap action if needed
				performData = abi.encode(
					activeStrategies[i],
					sell,
					update,
					newThreshold
				);
				return (true, performData);
			} else if (update) {
				// If no swap needed, check for threshold update
				// Note: This approach only encodes action for the first strategy needing an action.
				// If you want to encode actions for all strategies, you'd need to aggregate the data differently.
				performData = abi.encode(
					activeStrategies[i],
					sell,
					update,
					newThreshold
				);
				// Don't return yet if you want to prioritize sells across all strategies
			}
		}

		upkeepNeeded = (performData.length > 0);
		// performData already set within the loop for the first action identified
		return (upkeepNeeded, performData);
	}

	/**
	 * @notice Performs the upkeep of updating the stop loss threshold or triggering a sell.
	 * @dev Part of the Chainlink automation interface.
	 * @param performData Encoded data indicating the actions to perform.
	 */
	function performUpkeep(bytes calldata performData) external override {
		// Implement logic to perform TSL (e.g., swap to stablecoin) when conditions are met
		(
			address strategy,
			bool sell,
			bool updateThreshold,
			uint256 newThreshold
		) = abi.decode(performData, (address, bool, bool, uint256));
		if (sell) {
			//call trigger function to sell on uniswap
			uint256 s_erc20Balance = ITrailMix(strategy).getERC20Balance();
			ITrailMix(strategy).swapOnUniswap(s_erc20Balance);
			//deactivate TSL
			removeStrategy(strategy);

			//emit swap event
			emit SwapExecuted(
				strategy,
				ITrailMix(strategy).getCreator(),
				s_erc20Balance,
				ITrailMix(strategy).getStablecoinBalance(),
				ITrailMix(strategy).getERC20TokenAddress(),
				ITrailMix(strategy).getStablecoinAddress(),
				block.timestamp
			);
		} else if (updateThreshold) {
			//call updateThreshold function to update the threshold
			ITrailMix(strategy).updateTSLThreshold(newThreshold);
			//emit event for threshold update
			emit ThresholdUpdated(
				strategy,
				ITrailMix(strategy).getTSLThreshold(),
				newThreshold,
				block.timestamp
			);
		}
	}

	// Function to get all contracts deployed by a user
	function getUserContracts(
		address user
	) public view returns (address[] memory) {
		return userContracts[user];
	}
}
