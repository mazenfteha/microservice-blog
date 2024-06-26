## to build image from Dockerfile for each service :
### Navigate to the service directory
``` 
docker build -t service_name .
```

## for example build image from Dockerfile for user service :
```
cd apps  
```
```
docker build -t user .
```

## to build NGINX image : 
### Navigate to the proxy directory
```
docker build -t my-nginx .
```
## Run the Docker container for NGINX:
```
docker run -p 80:80 my-nginx
```
## to start the containers from docker-compose (the whole application)
```
docker-compose up --build 
```

## to stop & remove containers from docker-compose
```
docker-compose down
```
