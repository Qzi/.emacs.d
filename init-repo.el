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
(require 'tex-mik)

(setq TeX-auto-save t)
(setq TeX-parse-self t)
(setq-default TeX-master nil)

(add-hook 'LaTeX-mode-hook 'visual-line-mode)
(add-hook 'LaTeX-mode-hook 'flyspell-mode)
(add-hook 'LaTeX-mode-hook 'LaTeX-math-mode)

(add-hook 'LaTeX-mode-hook 'turn-on-reftex)
(setq reftex-plug-into-AUCTeX t)
(setq TeX-PDF-mode t)

    (add-hook 'LaTeX-mode-hook
              (lambda ()
                (setq TeX-auto-untabify t     ; remove all tabs before saving
                      TeX-engine 'xetex       ; use xelatex default
                      TeX-show-compilation t) ; display compilation windows
                (TeX-global-PDF-mode t)       ; PDF mode enable, not plain
                (setq TeX-save-query nil)
                (imenu-add-menubar-index)
                (define-key LaTeX-mode-map (kbd "TAB") 'TeX-complete-symbol)))


(provide 'init-repo)

