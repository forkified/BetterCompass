package main

import (
	"io"
	"log"
	"net/http"
	"net/url"
	"regexp"
)

func instance(r *http.Request) string {
	compassInstance := r.Header.Get("compassInstance")
	if compassInstance == "" {
		compassInstance = r.URL.Query().Get("compassInstance")
	}
	match, _ := regexp.MatchString("^[a-zA-Z0-9-]+$", compassInstance)
	if match {
		log.Print("Instance: " + compassInstance)
		return compassInstance + ".compass.education"
	} else {
		log.Print("Test fail, fallback instance: " + compassInstance)
		return "devices.compass.education"
	}
}

func main() {
	reverseProxy := http.HandlerFunc(func(rw http.ResponseWriter, req *http.Request) {
		originServerURL, _ := url.Parse("https://" + instance(req))

		req.Host = originServerURL.Host
		req.URL.Host = originServerURL.Host
		req.URL.Scheme = originServerURL.Scheme
		req.RequestURI = ""

		res, err := http.DefaultClient.Do(req)
		rw.Header().Set("Server", "BetterCompass Proxy GoLang")
		if err != nil {
			log.Print(err)
			rw.WriteHeader(500)
			io.WriteString(rw, `An internal server error occurred with the BetterCompass Proxy (go).`)
			return
		} else {
			res.Header.Del("Set-Cookie")
			res.Header.Del("Server")
			for key, values := range res.Header {
				for _, value := range values {
					rw.Header().Add(key, value)
				}
			}
			rw.WriteHeader(res.StatusCode)
			_, _ = io.Copy(rw, res.Body)
		}
	})
	log.Print("Listening on port 23997")
	log.Fatal(http.ListenAndServe(":23997", reverseProxy))
}
