.PHONY: start-server
start-server:
	uvicorn fin_pool.main:app --host 0.0.0.0 --port 8000 --reload


.PHONY: start-db
start-db:
	cd backend && docker-compose up postgres
	# docker-compose start postgres
	#  docker-compose up postgres
