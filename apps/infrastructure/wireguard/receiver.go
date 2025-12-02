package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"os/exec"
)

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

func exportHandler(w http.ResponseWriter, r *http.Request) {
	username, ok := getUsername(w, r)
	if !ok {
		http.Error(w, "Expected username query param", http.StatusBadRequest)
		return
	}
	path := getEnvOrFail("EXPORT_PATH")
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

func getEnvOrFail(key string) string {
	val := os.Getenv(key)
	if val == "" {
		log.Fatalf("Env variable %s is required", key)
	}
	return val
}

func main() {

	http.HandleFunc("/create", createHandler)
	http.HandleFunc("/delete", deleteHandler)
	http.HandleFunc("/export", exportHandler)
	http.HandleFunc("/list", listHandler)
	port := "8091"
	log.Println("Server started on", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
