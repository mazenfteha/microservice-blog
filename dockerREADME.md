## to build NGINX image : 
### Navigate to the proxy directory
```
docker build -t my-nginx .
```
## Run the Docker container for NGINX:
```
docker run -p 80:80 my-nginx
```
