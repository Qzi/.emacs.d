;; author: qzi
;; email: i@qzier.com
;; content: postfix


;;;; elisp
(add-to-list 'auto-mode-alist '("\\.el$" . lisp-mode)) 
;;
;;;; common lisp
(add-to-list 'auto-mode-alist '("\\.lisp$" . lisp-mode)) 
(add-to-list 'auto-mode-alist '("\\.cl$" . lisp-mode)) 
;;
;;;; js2-mode for javascript
;;(autoload 'js2-mode "js2-mode" nil t)
(add-to-list 'auto-mode-alist '("\\.js$" . js2-mode))
;;
;;;; c-mode for c
(add-to-list 'auto-mode-alist '("\\.c$" . c-mode)) 
;;
;;;; c++-mode for cpp
(add-to-list 'auto-mode-alist '("\\.cpp$" . c++-mode))
(add-to-list 'auto-mode-alist '("\\.cc$" . c++-mode)) 

;; yaml
(add-to-list 'auto-mode-alist '("\\.yml$" . yaml-mode))

;; markdown
(add-to-list 'auto-mode-alist '("\\.md$" . markdown-mode))
 

(provide 'init-postfix)
