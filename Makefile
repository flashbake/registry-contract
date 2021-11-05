OUT_DIR := ./smartpy_out
REGISTRY_CONTRACT := smart_contracts/registry.py
SMART_PY_CLI := ~/smartpy-cli/SmartPy.sh
SMART_PY_CLI_INSTALL_DIR := ~/smartpy-cli/

# Install smartpy
install-smartpy:
	rm -rf $(SMART_PY_CLI_INSTALL_DIR)
	curl -s https://smartpy.io/releases/20201222-65067da80037a151c726ae887cc2a24d02eca2b0/cli/install.sh | sh -s -- local-install $(SMART_PY_CLI_INSTALL_DIR)

# Compile the Flashbake Registry contract
compile-registry:
	$(SMART_PY_CLI) compile $(REGISTRY_CONTRACT) $(OUT_DIR)
	cp $(OUT_DIR)/registry/step_000_cont_0_contract.tz registry.tz
	rm -rf $(OUT_DIR)

# Test the Flashbake Registry contract
test-registry:
	$(SMART_PY_CLI) test $(REGISTRY_CONTRACT) $(OUT_DIR)
	rm -rf $(OUT_DIR)	