;; author: qzi
;; email: i@qzier.com
;; content: js

;; desc: js-comint
;; deps: node.js
;; Usage: ``M+x run-js`

(add-hook 'js2-mode-hook 
	  (lambda()
	    (require 'js-comint)
	    (setq inferior-js-program-command "node")
	    (setq inferior-js-mode-hook
		  (lambda ()
		    ;; We like nice colors
		    (ansi-color-for-comint-mode-on)
		    ;; Deal with some prompt nonsense
		    (add-to-list
		     'comint-preoutput-filter-functions
		     (lambda (output)
		       (replace-regexp-in-string "\033\\[[0-9]+[JG]" "" output)))))
	    ))


;; desc: flymake-jslint
(add-hook 'js2-mode-hook
	  (lambda()
	    ;; flymake jslint load
	    (flymake-jslint-load)
	    ;; jslint aux
	    (when (load "flymake" t)
	      (defun flymake-jslint-init ()
		(let* ((temp-file (flymake-init-create-temp-buffer-copy
				   'flymake-create-temp-inplace))
		       (local-file (file-relative-name
				    temp-file
				    (file-name-directory buffer-file-name))))
		  (list "jslint" (list local-file))))

	      (setq flymake-err-line-patterns 
		    (cons '("^  [[:digit:]]+ \\([[:digit:]]+\\),\\([[:digit:]]+\\): \\(.+\\)$"  
			    nil 1 2 3)
			  flymake-err-line-patterns))
	      
	      (add-to-list 'flymake-allowed-file-name-masks
			   '("\\.js\\'" flymake-jslint-init))

	      (require 'flymake-cursor)
	      )
	    ))

;; desc: more magic setting
;;
(add-hook 'js2-mode-hook
          (lambda ()
	    ;; set indent tabs mode off for jslint
	    (setq indent-tabs-mode nil)
	    ;; set tab width
	    (setq tab-width 2)
            ;; Scan the file for nested code blocks
            (imenu-add-menubar-index)
	    (set-fringe-style 5)
	    ;; next-error
	    (define-key js2-mode-map "\C-c\C-n" 'flymake-goto-next-error)
	    ;; flymake err menu
	    (define-key js2-mode-map [f5] 'flymake-display-err-menu-for-current-line)
            ;; Activate the folding mode
            (hs-minor-mode t)))


(provide 'init-js)
