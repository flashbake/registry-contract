SMART_PY_CLI := ~/smartpy-cli/SmartPy.sh
OUT_DIR := ./smartpy_out
TMP_INSTALL_SCRIPT_LOCATION := ./smartpy_tmp.sh
REGISTRY_CONTRACT := smart_contracts/registry.py

# Install smartpy
install-smartpy:
	curl -s "https://smartpy.io/releases/20210929-ec4c2020b1e18201600a732d442303c6830f8995/cli/install.sh" -o $(TMP_INSTALL_SCRIPT_LOCATION)
	sh $(TMP_INSTALL_SCRIPT_LOCATION)
	rm -rf $(TMP_INSTALL_SCRIPT_LOCATION)

# Compile the Flashbake Registry contract
compile-registry:
	$(SMART_PY_CLI) compile $(REGISTRY_CONTRACT) $(OUT_DIR)
	cp $(OUT_DIR)/registry/step_000_cont_0_contract.tz registry.tz
	rm -rf $(OUT_DIR)

# Test the Flashbake Registry contract
test-registry:
	$(SMART_PY_CLI) test $(REGISTRY_CONTRACT) $(OUT_DIR)
	rm -rf $(OUT_DIR)	