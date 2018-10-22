package main

import (
	"bytes"
	"html/template"
	"log"
	"net/http"
	"os"
	"time"
)

const mockJSON = `{
	"users": [
		{
			"name": "Willi",
			"image": "https://pbs.twimg.com/profile_images/975368054719897601/hX8OaArq_400x400.jpg"
		},
		{
			"name": "Maik",
			"image": "hhttps://ploigt.de/index_files/maik_ploigt.png"
		}
	]
}`

type templateConfig struct {
	ClientID string
}

var indexTemplate = template.Must(template.New("index").Parse(`<html>
	<head>
		<title>Directory - Sign In</title>
	</head>
	<body>
		<a href="https://slack.com/oauth/authorize?scope=identity.basic&client_id={{ .ClientID }}"><img alt="Sign in with Slack" height="40" width="172" src="https://platform.slack-edge.com/img/sign_in_with_slack.png" srcset="https://platform.slack-edge.com/img/sign_in_with_slack.png 1x, https://platform.slack-edge.com/img/sign_in_with_slack@2x.png 2x" /></a>
	</body>
</html>
`))

func main() {
	start := time.Now()

	cfg := templateConfig{
		ClientID: os.Getenv("CLIENT_ID"),
	}
	var index bytes.Buffer
	if err := indexTemplate.Execute(&index, cfg); err != nil {
		log.Fatalf("failed to execute index template: %s", err)
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/index.html", func(rw http.ResponseWriter, req *http.Request) {
		http.ServeContent(rw, req, "/index.html", start, bytes.NewReader(index.Bytes()))
	})
	mux.HandleFunc("/signin", func(rw http.ResponseWriter, req *http.Request) {
		http.Error(rw, "TODO", http.StatusNotImplemented)
	})
	mux.HandleFunc("/users.json", func(rw http.ResponseWriter, req *http.Request) {
		if req.Method != http.MethodGet {
			http.Error(rw, "use GET", http.StatusMethodNotAllowed)
			return
		}
		_, _ = rw.Write([]byte(mockJSON))
	})
	if err := http.ListenAndServe("localhost:8080", mux); err != nil {
		log.Printf("ListenAndServe: %s", err)
	}
}
