package main

import (
	"bytes"
	"context"
	"encoding/json"
	"html/template"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"
)

const slackTimeout = 2 * time.Second

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
	ClientID     string
	ClientSecret string
}

var indexTemplate = template.Must(template.New("index").Parse(`<html>
	<head>
		<title>Directory - Sign In</title>
	</head>
	<body>
		<a href="https://slack.com/oauth/authorize?scope=users:read&client_id={{ .ClientID }}"><img alt="Sign in with Slack" height="40" width="172" src="https://platform.slack-edge.com/img/sign_in_with_slack.png" srcset="https://platform.slack-edge.com/img/sign_in_with_slack.png 1x, https://platform.slack-edge.com/img/sign_in_with_slack@2x.png 2x" /></a>
	</body>
</html>
`))

func main() {
	start := time.Now()

	cfg := templateConfig{
		ClientID:     os.Getenv("CLIENT_ID"),
		ClientSecret: os.Getenv("CLIENT_SECRET"),
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
		ctx, cancel := context.WithTimeout(req.Context(), slackTimeout)
		defer cancel()
		params := url.Values{
			"client_id":     []string{cfg.ClientID},
			"client_secret": []string{cfg.ClientSecret},
			"code":          []string{req.FormValue("code")},
		}
		log.Printf("parms: %s", params.Encode())
		req, err := http.NewRequest(http.MethodPost, "https://slack.com/api/oauth.access", strings.NewReader(params.Encode()))
		if err != nil {
			log.Printf("failed to create auth request: %s", err)
			http.Error(rw, "logic error", http.StatusInternalServerError)
			return
		}
		req = req.WithContext(ctx)
		req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
		resp, err := http.DefaultClient.Do(req)
		if err != nil {
			log.Printf("failed to do auth request: %s", err)
			http.Error(rw, "forbidden", http.StatusForbidden)
			return
		}
		defer func() {
			_, _ = io.Copy(ioutil.Discard, resp.Body)
			_ = resp.Body.Close()
		}()
		if resp.StatusCode < 200 || resp.StatusCode >= 300 {
			log.Printf("auth response status %s", resp.Status)
			http.Error(rw, "forbidden", http.StatusForbidden)
			return
		}
		respBody := struct {
			OK          bool   `json:"ok"`
			AccessToken string `json:"access_token"`
			Error       string `json:"error"`
		}{}
		if err := json.NewDecoder(resp.Body).Decode(&respBody); err != nil {
			log.Printf("auth response unmarshaling failed: %s", err)
			http.Error(rw, "forbidden", http.StatusForbidden)
			return
		}
		if !respBody.OK {
			log.Printf("auth response not ok: %#q", respBody.Error)
			http.Error(rw, "forbidden", http.StatusForbidden)
			return
		}
		log.Printf("access_token: %#q", respBody.AccessToken)

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
