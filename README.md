_A code-less HTTP server setup in seconds_

Picture it: you're running through the forest with zombie
donkeys right behind you. They've been hunting you the whole
day, and it's already been 45 minutes of straight-up
sprint. You're exhausted. Suddenly, you need a very simple
local http server that just echoes what you're doing and
tells you what it sees.

Well, fear no more Dresdel, because I've got you covered.

This is an HTTP server that you can entirely start through a single command line,
and which will let you create several endpoints that behave the way you want.
As a bonus, it will snitch on who's calling it and what it's telling
it.

You can specify:

- What the endpoints are going to return (a fixed body, a file's content, or echo what it receives)
- Response status code
- What headers they're going to return

## Why would I use that?

- Stub APIs not ready yet
- Stub dependencies
- Look at what your app is sending for debug
- Test your app in erroneous replies cases
- Test connectivity

## Install

```
npm install -g bounce-server
```

## Use

This example creates two endpoints, a GET which does nothing, and a POST which responds
with what it receives.

```sh
bounce --get /api/users/:id/something --post /api/users/ --echo --port 8080 &

# Create endpoint GET /api/users/:id/something
# Create endpoint POST /api/users/
# Listening on port 8080

curl --header "thisis:a header" http://localhost:8080/api/users/123/something?this_is=a_query_parameter

# GET /api/users/:id/something
# Headers: {
#   "host": "localhost:8080",
#   "user-agent": "curl/7.47.0",
#   "accept": "*/*",
#   "thisis": "a header"
# }
# Query: {
#   "this_is": "a_query_parameter"
# }
# Params: {
#   "id": "123"
# }
# Body:

------------------------------

curl --header "thisis:a header" -X POST http://localhost:8080/api/users/ --data "this is the body"

# POST /api/users/
# Headers: {
#   "host": "localhost:8080",
#   "user-agent": "curl/7.47.0",
#   "accept": "*/*",
#   "thisis": "a header",
#   "content-length": "16",
#   "content-type": "application/x-www-form-urlencoded"
# }
# Query: {}
# Params: {}
# Body: this is the body


# ------------------------------
# this is the body ### <- this is curl's output
```

## Parameters

Available commands are the following: (check `bounce --help` to get the latest)

```
  -g, --get /relative/url/:optional_parameter/      create a GET endpoint
  -u, --put /relative/url/:optional_parameter/      create a PUT endpoint
  -p, --post /relative/url/:optional_parameter/     create a POST endpoint
  -d, --delete /relative/url/:optional_parameter/   create a DELETE endpoint
  -a, --all /relative/url/:optional_parameter/      create an endpoint matchin all methods
  -P, --port port number                            port to listen to. Defaults to environment variable PORT, then
                                                    8080
  -h, --help                                        display this message
```

In addition, the following sub-commands can be used to configure endpoints:

```
  -e, --echo                                        reply with request body
  -r, --response response body                      specify response to be sent
  -f, --file response file                          use a file containing the response
  -H, --header 'header: head'                       specify header to be replied. Can have multiple
  -s, --status http status                          specify status for response. Defaults to 200
  -x, --proxy-to https://www.google.com             Proxy request to another server. Response headers and status
                                                    code are returned. The 'host' header will be replaced to match
                                                    the destination server.
  --proxy-path                                      Proxy request path to the proxied as 
                                                    well. This is
                                                    especially useful if you catch all request to the proxy. (e.g.
                                                    --get '*' --proxy-to https://www.google.com --proxy-path). Path
                                                    is appended to any path defined it the proxy-to sub-command,
                                                    so don't use trailing slashes in the proxy path
```

Sub-commands are applied only to the commands that is before them. For example:

```sh
bounce --get / --response "Hello !" --get /admin --status 403 --response "Forbidden !" --get /package.json --file package.json --header "content-type: application/json"
```

This will:

- When calling GET / -> Return 200 with content "Hello !"
- When calling GET /admin -> Return 403 with content "Forbidden !"
- When calling GET /package.json -> Return contents of the file `package.json` with content-type header set to `application/json`.

## Matching order

Within a method, matching happens in order of definition, which means that if you define 
a `GET /` then a `GET *`, then `GET *` is not executed for `/`. 

`ALL` endpoints are executed after specific endpoints, which means that if you define `GET /`
and `ALL /`, that last endpoint will be matched only for `POST`, `PUT`, `DELETE`, etc.

If no endpoint is matched, a 404 is returned, with body explicitly stating that Bounce didn't
match anything. If you want to change that behavior, then specify a `--all '*'` endpoint with
the behavior you want at the end of the command.