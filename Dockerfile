FROM alpine:latest

#安装nginx
RUN apk --update add nginx

#nginx配置文件
COPY ./nginx.conf /etc/nginx/nginx.conf

#nginx.pid
RUN mkdir -p /usr/local/nginx/logs/

#拷贝web
ARG WEB_PATH
ADD ./build /usr/share/nginx/html/web/$WEB_PATH/

ENTRYPOINT nginx -g "daemon off;"