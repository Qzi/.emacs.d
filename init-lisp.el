;; author: qzi
;; email: i@qzier.com
;; content: lisp

;; elisp
;; ======
;;


;; Scheme
;; =======
;;
;; desc: scheme-mode
;; deps: mit-scheme
;;
(setq scheme-program-name "/opt/local/bin/scheme")


;; Common lisp
;; ============
;;
;; desc: quicklisp
;; link: http://www.quicklisp.org
;;
(load (expand-file-name "~/quicklisp/slime-helper.el"))
;; Replace "sbcl" with the path to your implementation
(setq inferior-lisp-program "/opt/local/bin/ccl64")
;;(add-to-list 'auto-mode-alist '("\\.lisp$" . lisp-mode)) 


;; desc: lisp-mode 自动完成功能
;; deps: slime(quicklisp/slime-helper)
;;
(defun lisp-indent-or-complete (&optional arg)
  (interactive "p")
  (if (or (looking-back "^\\s-*") (bolp))
      (call-interactively 'lisp-indent-line)
      (call-interactively 'slime-indent-and-complete-symbol)))

(eval-after-load "lisp-mode"
  '(progn
     (define-key lisp-mode-map (kbd "TAB") 'lisp-indent-or-complete)))


(provide 'init-lisp)
