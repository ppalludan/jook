![alt text](https://github.com/ppalludan/jook/blob/develop/lib/logo.png "Jook")


`tl;dr` 
Very simple Github Hook Server Written in Node.js

## installation

```bash
npm install jook
```

or to make it global

```bash
npm install jook -g
```

## usage

	-p, --port [number]  

	    Port Number for the webserver ( Default port is 8080 ), can also be set in configuration file

	-c, --config [filename]

		Give a unique configuration file name ( default is jook.config )

	--start 

		Run jook as a background daemon

	--stop

		When started as a daemon, you can shut it down using this 


## configuration

jook.config
```js
{
	"port" : 8080,
	"username" : "your name",
	"password" : "should be secret?",
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

- Handle secret
- Add security


## license

The MIT License (MIT)

Copyright (c) 2014 Peter Palludan

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
