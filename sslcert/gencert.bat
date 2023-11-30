openssl genrsa -out server.key 2048
openssl req -new -key server.key -out server.csr
openssl x509 -req -days 9999 -in server.csr -signkey server.key -out server.crt