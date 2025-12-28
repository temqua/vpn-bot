package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
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

func fileHandler(w http.ResponseWriter, r *http.Request) {
	username, ok := getUsername(w, r)
	if !ok {
		http.Error(w, "Expected username query param", http.StatusBadRequest)
		return
	}
	baseDir := getEnvOrFail("OVPN_CLIENTS_DIR")
	filePath := filepath.Join(
		baseDir,
		username+".ovpn",
	)
	absPath, err := filepath.Abs(filePath)
	if err != nil {
		http.Error(w, "Invalid path "+err.Error(), http.StatusInternalServerError)
		return
	}
	if _, err := os.Stat(absPath); err != nil {
		if os.IsNotExist(err) {
			http.Error(w, "File "+absPath+" not found", http.StatusNotFound)
		} else {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}
	w.Header().Set("Content-Type", "application/x-openvpn-profile")
	w.Header().Set(
		"Content-Disposition",
		fmt.Sprintf(`attachment; filename="%s.ovpn"`, username),
	)
	http.ServeFile(w, r, absPath)
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
		if r.Header.Get("Authorization") != token {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
		next.ServeHTTP(w, r)
	})
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
	http.HandleFunc("/file", fileHandler)
	http.HandleFunc("/ping", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprint(w, "PONG")
	})
	port := "8092"

	var handler http.Handler = http.DefaultServeMux
	handler = loggingMiddleware(handler)
	handler = authMiddleware(handler)

	log.Println("Server started on", port)
	log.Fatal(http.ListenAndServeTLS(":"+port, "/etc/ssl/certs/api/cert.pem", "/etc/ssl/certs/api/key.pem", handler))

}
