<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

Hola, este es el proyecto backend de redes neuronales, el proyecto funciona como una API REST que tiene como objetivo comunicarse con una aplicacion frontend, siendo el frontend quien consume de esta API

### Programas necesarios
1. Docker Desktop (La bd es en postgresql, esta en un contenedor en docker para evitar instalar todo lo de postgre)
2. POSTMAN (Para probar los endpoints del backend)
3. Tener instalado NESTCLI de preferencia. Mas información en este link: 
```
https://docs.nestjs.com/cli/overview
```
o correr este comando en el cmd para instalarlo directamente
```
npm install -g @nestjs/cli
```
4. Tener un programa para visualizar la BD, en mi caso yo tengo Table Plus, lo pueden descargar en este link:
```
https://tableplus.com/download/
```


### Pasos para correr el proyecto

1. Clonar el repositorio
2. Descargar dependencias
```
npm install
```
3. Copiar el archivo ```.env.template``` y renombrarlo ```.env```
4. Colocar las variables de entorno por las suyas propias
5. Preparar y lanzar la base de datos en este comando
```
docker-compose up -d
```
6. Levantar el proyecto
```
npm run start:dev
``` 

### Pasos para conectar TablePlus con la BD
1. Entrar a TablePlus
2. Dar click en el signo de "+" y seleccionar ``PostgreSQL``
3. En el campo "Name" colocar (El nombre es arbitrario):
```
ProyectoRedesNeuronales
```
4. En el campo "Host" colocar el valor de la variable de entorno ``DB_HOST``
5. En el campo "User" agregar el valor de la variable de entorno ``DB_USERNAME``
6. Campo "Password" agregar el valor de la variable de entorno ``DB_PASSWORD``
7. En el campo "Port" agregar el valor de la variable de entorno ``DB_PORT``
8. Hacer Click en "test" si responde "ok" entonces hay conexion con la bd, sino comprobar los valores agregados
9. Dar click en connect

### Diagrama Entidad - Relación
```
https://dbdiagram.io/d/ProyectoRedesNeuronales-68d066fc960f6d821a1c52b6
```

### Conseguir la API KEY de Gemini
Para esta parte no estamos usando una red neuronal como tal, sino la API de Gemini, para que ustedes la pueden usar tienen que seguir esta serie de pasos

1. Ir a este link:
```
https://aistudio.google.com/welcome?utm_source=google&utm_medium=cpc&utm_campaign=Cloud-SS-DR-AIS-FY26-global-gsem-1713578&utm_content=text-ad&utm_term=KW_google%20studio&gad_source=1&gad_campaignid=23417416052&gbraid=0AAAAACn9t652w7jLoTz-0WJrqeXTMr33E&gclid=Cj0KCQjw-pHPBhCdARIsAHXYWP9gEbVplUAE8ani2dRy0TvpjN2hcFzRwTj7a0-eQrcDNJKSs6n-x7UaArytEALw_wcB
```
2. Iniciar sesión o registrarse
3. Dar click en el boton ``Get an API key ``
4. Dar click en ``Crear clave de API ``
5. Asignar un nombre a la clave (si les pide proyecto pongan default gemini proyect)
6. Le dan a boton ``Crear Clave``
7. Copiar la clave y pegarla en las variables de entorno

### Endpoints Disponibles
Para ver la documentacion de los endpoinst que es utilizando swagger, visiten el siguiente link con el proyecto levantado:
```
http://localhost:3000/api
```

### Modulos del proyecto

1. Auth: Este modulo se encarga de inicar sesion o registrar a un nuevo usuario, usando JWT para la autenticacion 
 - Cuerpo que espera la peticion de agregar un nuevo usuario 
```
{
    "name": "Aldo Raymundo Cavazos Caro",
    "email": "aldo158@gmail.com",
    "password": "Abc123",
    "availableHoursPerDay": 12
}
```
 - Cuerpo que espera la peticion de iniciar sesión 
```
{
    "email": "aldo158@gmail.com",
    "password": "Abc123",
}
```

2. Task: Este modulo espera que usuario autenticado agregue sus actividades para despues utilizar el modulo recommendation
 - Cuerpo esperado en peticion POST crear un nuevo task:
```
{
    "title": "Alegrba para Ingenieria",
    "description": "Resolver los problemas de los examenes que filtraron",
    "difficulty": 10,
    "estimatedTime": 60,
    "deadline": "5-04-2026"
}
```

3. Recommendation: Este modulo para usarse necesita minimo 1 task ya agregada por el usuario al momento de hacer la peticion POST ya usa la API de gemini y genera el plan de estudios

4. ai: Este modulo no tiene endpoints, simplemente se comnunica con el modulo anterior para generar una respuesta de gemini


### Utilizar endpoints en POSTMAN
En la raiz del proyecto hay un archivo llamado: ``ProyectoRedes.postman_collection`` con este archivo se tienen que ir a:
```
 postman > import > files
```
Asi tendran todos los endpoints en POSTMAN a la mano

