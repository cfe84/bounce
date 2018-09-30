_A code-less, dev/hack multi purpose HTTP server, setup in seconds, running
in CLI, Node, Docker or Kubernetes out of the box_

```
   ___  _  _ _  _  _  __  ___ 
  | o )/ \| | || \| |/ _|| __|
  | o ( o ) U || \\ ( (_ | _| 
  |___/\_/|___||_|\_|\__||___|

```

![](https://chfeval.blob.core.windows.net/share/picture/bounce-example.gif?st=2018-06-08T21%3A38%3A19Z&se=2021-06-09T21%3A38%3A00Z&sp=rl&sv=2017-07-29&sr=b&sig=9h%2B3xjZn4w1rNJRIUstxhup4yZl%2FnBBeh8Db64mExVo%3D)

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
- Have a simple server you can use to play with cool tech (e.g. Kubernetes)
- Look at what your app is sending for debug
- As a proxy to spy on what is sent to a server you're integrating with
- Test your app in erroneous replies cases
- Test connectivity

## How do I run it?

### Using CLI

1. Install from npm 
```
npm install -g bounce-server
```
2. Run using command `bounce`

![](https://chfeval.blob.core.windows.net/share/picture/bounce.gif?st=2018-05-31T23%3A15%3A43Z&se=2024-06-01T23%3A15%3A00Z&sp=rl&sv=2017-04-17&sr=b&sig=4dLyKApD2pr2tjOqMU1by77WjoL3p7jb2w%2FdFFgaxro%3D)

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

### Deployed on a server

1. Create a free [Azure WebApp](https://azure.microsoft.com/en-us/services/app-service/web/)
2. Fork the GitHub repo on your GitHub account
3. Add an environment variable / app config key called `BOUNCE_COMMAND` and set it to what you want
4. In the Deployment options, deploy from GitHub and choose your fork

### Using a Docker Container

1. Run container from DockerHub: cfe84/bounce

```
docker run --env BOUNCE_COMMAND="-g / -r Hurray" cfe84/bounce
```

Put whatever you want in the `BOUNCE_COMMAND`

### Using Kubernetes

1. Export a secret called `bounce-command` with a key called `bounce-command` and containing the
command you want to run: `kubectl create secret generic bounce-command --from-literal=bounce-command="-g / -r YO"`
2. `kubectl apply -f deploy.yaml` asks for a Load Balancer and exposes bounce on port 8080.

## Parameters

Available commands are the following: (check `bounce --help` to get the latest)

```
  -g, --get /relative/url/:optional_parameter/      create a GET endpoint
  -u, --put /relative/url/:optional_parameter/      create a PUT endpoint
  -p, --post /relative/url/:optional_parameter/     create a POST endpoint
  -d, --delete /relative/url/:optional_parameter/   create a DELETE endpoint
  -a, --all /relative/url/:optional_parameter/      create an endpoint matchin all methods
  -P, --port port number                            port to listen to. Defaults to environment variable PORT, then 8080
  -h, --help                                        display this message
  -q, --quiet                                       do not output to console
  -S, --https                                       setup the server as https
  --https-certfile filepath                         Client certificate for https endpoint
  --https-keyfile filepath                          Secret client key for https endpoint
  --https-cert certificate content                  Client certificate for https endpoint
  --https-key key contnet                           Secret client key for https endpoint
```

In addition, the following sub-commands can be used to configure endpoints:

```
  -e, --echo                                        reply with request body
  -E, --env                                         dump environment variables
  -i, --info                                        reply with information about the call (headers, query, ...).
                                                    Incompatible with other responses.
  -G, --guid                                        when the node application is starting, a GUID is generated. This
                                                    replies with this GUID. Particularly useful to test load balancing
                                                    and server stickiness
  -r, --response response body                      specify response to be sent. Supports templating from url (e.g. if
                                                    url is /users/:id/ and response is 'User {id} not known', when
                                                    calling /users/123/, response will be User 123 not known)
  -f, --file response file                          use a file containing the response
  -H, --header 'header: head'                       specify header to be replied. Can have multiple
  -s, --status http status                          specify status for response. Defaults to 200
  --cpu time in seconds                             will try to use 100% of one CPU for seconds. Also supports units,
                                                    add h, m, s or ms to specify a duration, and c, Kc, Mc, Gc and Tc
                                                    to specify a number of cycles. Default is seconds.
  -x, --proxy-to https://www.google.com             Proxy request to another server. Response headers and status code
                                                    are returned. The 'host' header will be replaced to match the
                                                    destination server.
  --proxy-path                                      Proxy request path to the proxied server as well. This is
                                                    especially useful if you catch all request to the proxy. (e.g.
                                                    --get '*' --proxy-to https://www.google.com --proxy-path). Path is
                                                    appended to any path defined it the proxy-to sub-command, so don't
                                                    use trailing slashes in the proxy path
  --proxy-certfile filepath                         Client certificate to authenticate requests to proxy
  --proxy-keyfile filepath                          Secret client key to authenticate requests
  --proxy-cert certificate content                  Client certificate to authenticate requests to proxy
  --proxy-key keyfile content                       Secret client key to authenticate requests
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

## Using environment variable instead of command line

Bounce can also be used with environment variable. This is useful if you want to deploy
it on an Azure app service for test purposes, for example. In this case, define an environment
variable called `BOUNCE_COMMAND` and set it to the command to run BOUNCE (e.g. `--get /`), then 
start bounce without parameters (`bounce` or `node server.js`).

When the `BOUNCE_COMMAND` variable is defined, bounce is ignoring the command line.
