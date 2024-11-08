#source .env in .env directory
-include .env

.PHONY: deploy compile


compile:	
	@npx hardhat compile


#####################
# Deployment
#####################

# 0 - Create a .env file based on .env.example and set the DEPLOYER_PRIVATE_KEY
#	- 

deploy:
ifdef chain
	@echo Deploying ${tags} contract on ${chain}
	@npx hardhat deploy --tags ${tags} --network ${chain}
else
	@echo You need to specify a chain "(ex: chain=arbitrumone to deploy on Arbitrum mainnet)"
endif


# 1 - Deploy governance Access Control Manager (ACM)
deploy_acm:
	@make deploy tags=AccessControl chain=${chain}

# 2 - Deploy governance Normal/Fast/Critical timelock
deploy_timelock:
	@make deploy tags=RemoteTimelock chain=${chain}	

# 3 - Deploy Pool Registry
deploy_poolregistry:
	@make deploy tags=PoolRegistry chain=${chain}	

# 4 - Deploy Pool Lens
deploy_poollens:
	@make deploy tags=PoolLens chain=${chain}	

# 5 - Deploy Comptollers
deploy_comptrollers:
	@make deploy tags=Comptrollers chain=${chain}	

# 6 - Deploy Protocol Share Reserve
deploy_psr:
	@make deploy tags=ProtocolShareReserve chain=${chain}

# 7 - Deploy VTokens
deploy_vtokens:
	@make deploy tags=VTokens chain=${chain}
# 8 - Deploy VTreasury
deploy_vtreasury:	
	@make deploy tags=VTreasuryV8 chain=${chain}




#TODO
#12 - TransferPoolOwnership 
transfer_pool_ownership
	@make deploy tags=TransferPoolsOwnership chain=${chain}