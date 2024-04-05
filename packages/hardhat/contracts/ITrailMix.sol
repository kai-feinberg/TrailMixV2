// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

interface ITrailMix {
	// Events
	event Deposit(address indexed user, uint256 amount);
	event Withdraw(address indexed user, uint256 amount);
	event TSLUpdated(uint256 newThreshold);
	event SwapExecuted(uint256 amountIn, uint256 amountOut);

	// Function signatures
	function deposit(uint256 amount, uint256 tslThreshold) external;

	function withdraw() external;

    function checkUpkeepNeeded() external view returns (bool, bool, uint256);

	function updateTSLThreshold(uint256 newThreshold) external;

	function getLatestPrice() external view returns (uint256);

	function swapOnUniswap(uint256 amount) external;



	function activateSlippageProtection() external;

	function getERC20Balance() external view returns (uint256);

	function getStablecoinBalance() external view returns (uint256);

	function getTSLThreshold() external view returns (uint256);

	function isTSLActive() external view returns (bool);

	function getERC20TokenAddress() external view returns (address);

	function getStablecoinAddress() external view returns (address);

	function getUniswapRouterAddress() external view returns (address);

	function getTrailAmount() external view returns (uint256);

	function getManager() external view returns (address);

    function getCreator() external view returns (address);

	function getGranularity() external view returns (uint256);

	function getUniswapPool() external view returns (address);
}
