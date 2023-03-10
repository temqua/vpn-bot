deploy:
	docker-compose up --build -d

dev:
	docker-compose -f ./docker-compose.debug.yml up --build -d