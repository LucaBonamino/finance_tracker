PROJECT_NAME = FinPool

SHELL_DOT = $(shell printf "\033[34;1m▶\033[0m")


.DEFAULT_GOAL := help

.PHONY: help
help:
	@echo "Available targets:"
	@echo "$(SHELL_DOT) help          	- Display this help message"
	@echo "$(SHELL_DOT) setup        	- Install packeges"
	@echo "$(SHELL_DOT) setup-db        - Setup/restore db.json file"
	@echo "$(SHELL_DOT) save-db        	- Save db.json into db-template.json file"
	@echo "$(SHELL_DOT) backuo-db       - Backup db.json into dbBackups directory"


.PHONY: setup
setup:
	@$(info $(SHELL_DOT) inatalling packages...)
	@npm install

.PHONY: setup-db
setup-db:
	@$(info $(SHELL_DOT) setting up/restoring db.json file...)
	@cp -i db-template.json db.json

.PHONY: save-db
save-db:
	@$(info $(SHELL_DOT) saving db.json file into db-template.json...)
	@cp -i db.json db-template.json

.PHONY: backup-db
backup-db:
	@$(info $(SHELL_DOT) backup json.db file...)
	@cp -i db.json dbBackups/db.json