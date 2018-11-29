package main

import (
	"log"
	"net/http"
	"strings"
)

const mockJSON = `{
	"results": [
		{
			"name": "Willi ❤ Destiny 2",
			"picture": {
				"large": "https://pbs.twimg.com/profile_images/975368054719897601/hX8OaArq_400x400.jpg"
			}
		},
		{
			"name": "Maik",
			"picture": {
				"large": "https://ploigt.de/index_files/maik_ploigt.png"
			}
		}
	]
}`

func main() {
	const mockToken = "totally not a fake token, I swear"

	mux := http.NewServeMux()
	mux.HandleFunc("/signin", func(rw http.ResponseWriter, req *http.Request) {
		if req.Method != http.MethodPost {
			http.Error(rw, "use POST", http.StatusMethodNotAllowed)
			return
		}
		_, _ = rw.Write([]byte(`{
			"token": "` + mockToken + `"
		}`))
	})
	mux.HandleFunc("/users.json", func(rw http.ResponseWriter, req *http.Request) {
		if req.Method != http.MethodGet {
			http.Error(rw, "use GET", http.StatusMethodNotAllowed)
			return
		}
		auth := req.Header.Get("Authorization")
		if !strings.HasPrefix(auth, "Bearer ") {
			http.Error(rw, "need Bearer token", http.StatusUnauthorized)
			return
		}
		token := strings.TrimPrefix(auth, "Bearer ")
		if token != mockToken {
			http.Error(rw, "forbidden", http.StatusForbidden)
			return
		}
		_, _ = rw.Write([]byte(mockJSON))
	})
	if err := http.ListenAndServe("localhost:8080", mux); err != nil {
		log.Printf("ListenAndServe: %s", err)
	}
}
