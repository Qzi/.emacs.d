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
(setq load-path (append (list (expand-file-name "~/.emacs.d/elpa/js2-mode-20130307")) load-path))

;; desc: yaml
(add-to-list 'load-path "~/.emacs.d/elpa/yaml-mode-0.0.7")

;; desc: pos-tip for auto-complete
;; link:  https://github.com/winterTTr/emacs-of-winterTTr/blob/master/.emacs.d/plugins/auto-complete-suite/pos-tip/pos-tip.el
(add-to-list 'load-path "~/.emacs.d/plugins/ac-pos-tip")

;; fuzzy for auto-complete
(add-to-list 'load-path "~/.emacs.d/elpa/fuzzy-match-1.4")

;; sr-speedbar
(add-to-list 'load-path "~/.emacs.d/elpa/sr-speedbar-0.1.8")


(provide 'init-repo)

