jook
====



`tl;dr` 
Very simple Github Hook Server Written in Node.js

## Installation

```bash
npm install jook
```

or to make it global

```bash
npm install jook -g
```

## Usage

	-p, --port [number]  

	    Port Number for the webserver ( Default port is 8080 ), can also be set in configuration file

	-c, --config [filename]

		Give a unique configuration file name ( default is jook.config )

	--start 

		Run jook as a background process

	--stop

		When started as a daemon, you can shut it down using this 


## Configuration

jook.config
```js
{
	"port" : 8080,
   	"repositories" : [
   		{
   			"name" : "ppalludan/jook",
   			"process" : [
   				{
                  	"name" : "test",
   					"exec" : "./bla/test.sh"
   				}, 
   				{
                 	"name" : "build",
   					"exec" : "./bla/build.sh"
   				}
   			]
   		}
   ]
}
```


## roadmap

	Handle secret
	Add security
