PROJECT_NAME = finance_tracker

SHELL_DOT = $(shell printf "\033[34;1m▶\033[0m")


.DEFAULT_GOAL := help

.PHONY: help
help:
	@echo "Available targets:"
	@echo "$(SHELL_DOT) help          	- Display this help message"
	@echo "$(SHELL_DOT) setup        	- Install packeges"
	@echo "$(SHELL_DOT) setup-db        - Setup/restore db.json file"


.PHONY: setup
setup:
	@$(info $(SHELL_DOT) inatalling packages...)
	@npm install

.PHONY: setup-db
setup-db:
	@$(info $(SHELL_DOT) setting up/restoring db.json file...)
	@cp -i db-template.json db.json