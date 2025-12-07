package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"os/exec"
)

type Middleware func(http.HandlerFunc) http.HandlerFunc

func getUsername(w http.ResponseWriter, r *http.Request) (string, bool) {
	username := r.URL.Query().Get("username")
	if username == "" {
		http.Error(w, "missing username", http.StatusBadRequest)
		return "", false
	}
	return username, true
}

func runScript(script string, args ...string) (string, error) {
	out, err := exec.Command(script, args...).CombinedOutput()
	return string(out), err
}

func createHandler(w http.ResponseWriter, r *http.Request) {
	username, ok := getUsername(w, r)
	if !ok {
		http.Error(w, "Expected username query param", http.StatusBadRequest)
		return
	}
	path := getEnvOrFail("CREATE_PATH")
	out, err := runScript(path, username)
	if err != nil {
		message := out
		if out == "" {
			message = err.Error()
		}
		http.Error(w, message, http.StatusInternalServerError)
		return
	}

	fmt.Fprint(w, out)
}

func deleteHandler(w http.ResponseWriter, r *http.Request) {
	username, ok := getUsername(w, r)
	if !ok {
		http.Error(w, "Expected username query param", http.StatusBadRequest)
		return
	}
	path := getEnvOrFail("DELETE_PATH")
	out, err := runScript(path, username)
	if err != nil {
		message := out
		if out == "" {
			message = err.Error()
		}
		http.Error(w, message, http.StatusInternalServerError)
		return
	}

	fmt.Fprint(w, out)
}

func listHandler(w http.ResponseWriter, r *http.Request) {
	path := getEnvOrFail("LIST_PATH")
	out, err := runScript(path)
	if err != nil {
		http.Error(w, out, http.StatusInternalServerError)
		return
	}

	fmt.Fprint(w, out)
}

func pauseHandler(w http.ResponseWriter, r *http.Request) {
	path := getEnvOrFail("PAUSE_PATH")
	out, err := runScript(path)
	if err != nil {
		http.Error(w, out, http.StatusInternalServerError)
		return
	}

	fmt.Fprint(w, out)
}

func getEnvOrFail(key string) string {
	val := os.Getenv(key)
	if val == "" {
		log.Fatalf("Env variable %s is required", key)
	}
	return val
}

func loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path := r.URL.Path
		if r.URL.RawQuery != "" {
			path += "?" + r.URL.RawQuery
		}

		log.Printf("%s %s", r.Method, path)
		next.ServeHTTP(w, r)
	})
}

func authMiddleware(next http.Handler) http.Handler {
	token := getEnvOrFail("SERVICE_TOKEN")
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Header.Get("X-Auth-Token") != token {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func main() {
	http.HandleFunc("/create", createHandler)
	http.HandleFunc("/delete", deleteHandler)
	http.HandleFunc("/list", listHandler)
	http.HandleFunc("/pause", pauseHandler)

	var handler http.Handler = http.DefaultServeMux
	handler = loggingMiddleware(handler)
	handler = authMiddleware(handler)

	port := "8091"
	log.Println("Server started on", port)
	log.Fatal(http.ListenAndServe(":"+port, handler))
}
