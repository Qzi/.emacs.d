;; author: qzi
;; email: i@qzier.com
;; content: repos

;; online repo
;; ------------
;; marmalade-repo.org
(require 'package)
(add-to-list 'package-archives 
    '("marmalade" .
      "http://marmalade-repo.org/packages/"))
(package-initialize)


;; Local repo
;; ------------
;; desc: js2-mode for javascript

;; desc: yaml
(add-to-list 'load-path "~/.emacs.d/elpa/yaml-mode-0.0.7")

;; desc: pos-tip for auto-complete
;; link:  https://github.com/winterTTr/emacs-of-winterTTr/blob/master/.emacs.d/plugins/auto-complete-suite/pos-tip/pos-tip.el
(add-to-list 'load-path "~/.emacs.d/plugins/ac-pos-tip")

;; fuzzy for auto-complete
(add-to-list 'load-path "~/.emacs.d/elpa/fuzzy-match-1.4")

;; sr-speedbar
(add-to-list 'load-path "~/.emacs.d/elpa/sr-speedbar-0.1.8")

;; powerline
;;(add-to-list 'load-path "~/.emacs.d/plugins/emacs-powerline")
(add-to-list 'load-path "~/.emacs.d/plugins/powerline")
;;(load-file "~/.emacs.d/plugins/emacs-powerline/powerline.el")

;; auctex
(add-to-list 'load-path "~/.emacs.d/elpa/auctex-11.86/")
(load "preview.el" nil t t)

;; rainbow
(add-to-list 'load-path "~/.emacs.d/plugins/rainbow-mode/")

;; clang
(add-to-list 'load-path "~/.emacs.d/plugins/auto-complete-clang/")

;; js-commit
(add-to-list 'load-path "~/.emacs.d/elpa/js-comint-0.0.1")


(provide 'init-repo)

