package main

import (
	"log"
	"net/http"
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

func main() {
	mux := http.NewServeMux()
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
