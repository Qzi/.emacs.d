;; author: qzi
;; email: i@qzier.com
;; content: lisp

;; elisp
;; ======
;;
;; emacs-lisp-mode
(defun my-ac-emacs-lisp-mode-setup ()
  (setq ac-sources (append '(ac-source-emacs-lisp-features) ac-sources)))
(add-hook 'emacs-lisp-mode-hook 'my-ac-emacs-lisp-mode-setup)

;; lisp-interaction-mode
(defun my-ac-lisp-interaction-mode-setup ()
  (setq ac-sources (append '(ac-source-emacs-lisp-features) ac-sources)))
(add-hook 'lisp-interaction-mode-hook 'my-ac-lisp-interaction-mode-setup)


;; Scheme
;; =======
;;
;; desc: scheme-mode
;; deps: mit-scheme
;;
(setq scheme-program-name "/opt/local/bin/scheme")


;;;; Common lisp
;;;; ============
;;;;
;;;; desc: quicklisp
;;;; link: http://www.quicklisp.org
;;;;
;;(load (expand-file-name "~/quicklisp/slime-helper.el"))
;;;; Replace "sbcl" with the path to your implementation
;;(setq inferior-lisp-program "/opt/local/bin/ccl64")
;;;;(add-to-list 'auto-mode-alist '("\\.lisp$" . lisp-mode)) 
;; 
;; 
;;;; desc: lisp-mode 自动完成功能
;;;; deps: slime(quicklisp/slime-helper)
;;;;
;;(defun lisp-indent-or-complete (&optional arg)
;;  (interactive "p")
;;  (if (or (looking-back "^\\s-*") (bolp))
;;      (call-interactively 'lisp-indent-line)
;;      (call-interactively 'slime-indent-and-complete-symbol)))
;; 
;;;;(eval-after-load "lisp-mode"
;;;;  '(progn
;;;;     (define-key lisp-mode-map (kbd "TAB") 'lisp-indent-or-complete)))
;;;;

(add-hook 'lisp-mode-hook 

	  (lambda()
	    ;; load the slime-helper
	    (load (expand-file-name "~/quicklisp/slime-helper.el"))
	    ;; Replace "sbcl" with the path to your implementation
	    (setq inferior-lisp-program "/opt/local/bin/ccl64")
	    ;; postfix 
	    (add-to-list 'auto-mode-alist '("\\.lisp$" . lisp-mode)) 
	    ;; start slime
	    (slime)

	    ;; desc: lisp-mode 自动完成功能
	    ;; deps: slime(quicklisp/slime-helper)
	    (defun lisp-indent-or-complete (&optional arg)
	      (interactive "p")
	      (if (or (looking-back "^\\s-*") (bolp))
		  (call-interactively 'lisp-indent-line)
		(call-interactively 'slime-indent-and-complete-symbol)))
	    
	    ;;(eval-after-load "lisp-mode"
	    ;;  '(progn
	    ;;     (define-key lisp-mode-map (kbd "TAB") 'lisp-indent-or-complete)))
	    ))


(provide 'init-lisp)
