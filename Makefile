

VENV := .venv
PYTHON := $(VENV)/bin/python
PIP := $(VENV)/bin/pip
PYTEST := $(VENV)/bin/pytest


init:
	python3 -m venv $(VENV)
	$(PIP) install -r requirements.txt

scrape: init
	$(PYTHON) src/scraper.py

clean:
	rm -rf $(VENV)
	find . -name __pycache__ -exec rm -rf {} \;
	find . -name '*.pyc' -exec rm -f {} \;

test: init
	$(PYTEST) tests

.PHONY: init scrape clean test