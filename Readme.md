# Deep Breath

Air Quality monitoring service.


## Prerequirements

* RabbitMQ instance (configured in *store.rabbitmq* and *datasource.rabbitmq* sections)
* PostgreSQL database (configured in *store.database* section)


## Installation

```bash
npm install
```


## Supported datasources

* pl-wielkopolskie
* pl-zachodniopomorskie
* pl-lubuskie
* pl-slaskie
* pl-dolnoslaskie
* pl-malopolskie
* pl-opolskie
* pl-podkarpackie


## Execution

You need to run several services:

```bash
node store
node datasource-dacsystem.js <datasource name>
node aqi
node mobile
```

Default environment is set to *localhost*. You can override this with *NODE_ENV* environment variable.


## Tests
Real man push their code directly to production.