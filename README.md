An application that creates trailing stop losses for assets on Base. Forked from scaffoldEth2.

Live application: https://trailmix-v2.vercel.app/
Demo: https://www.youtube.com/watch?v=gHNL6JYiPuc

## Run locally
Fork repo and install dependencies. 

Add your deployer private key to an .env file

Deploy a TrailMixManager contract with the `yarn deploy --network base` command

To automate the contracts make a web3Function task on gelato. Make an automation for the manager contract automating the execution of the checker() function at set time intervals (15s is tha most frequent that will fit in the free plan). 

After the task is created use basescan or remix to set the gelato executor to the designated automation sender that gelator provides.

Run `yarn start` to start the nextjs app.
