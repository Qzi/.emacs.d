;; author: qzi
;; email: i@qzier.com
;; content: tex && latex

(require 'tex-mik)

(setq TeX-auto-save t)
(setq TeX-parse-self t)
(setq-default TeX-master nil)

(add-hook 'LaTeX-mode-hook 'visual-line-mode)
(add-hook 'LaTeX-mode-hook 'flyspell-mode)
(add-hook 'LaTeX-mode-hook 'LaTeX-math-mode) ;; math

;; reftex
(add-hook 'LaTeX-mode-hook 'turn-on-reftex)
(setq reftex-plug-into-AUCTeX t)

;; more default config
(add-hook 'LaTeX-mode-hook
	  (lambda ()
	    (setq TeX-auto-untabify t     ; remove all tabs before saving
		  TeX-engine 'xelatex       ; use xelatex default
		  TeX-show-compilation t) ; display compilation windows
	    (TeX-global-PDF-mode t)       ; PDF mode enable, not plain
	    (setq TeX-save-query nil)
	    (imenu-add-menubar-index)
	    (define-key LaTeX-mode-map (kbd "TAB") 'TeX-complete-symbol)))


;; XeLaTeX compiler
(add-hook 'LaTeX-mode-hook 
	  (lambda()
	    (add-to-list 'TeX-command-list '("XeLaTeX" "%`xelatex%(mode)%' %t" TeX-run-TeX nil t))
	    (setq TeX-command-default "XeLaTeX")
	    (setq TeX-save-query  nil )
	    (setq TeX-show-compilation t)
	    ))

;; mac
(setq TeX-view-program-list '(("open" "open %o")))
(add-hook 'LaTeX-mode-hook
	  (lambda ()
	    (setq TeX-view-program-selection '((output-pdf "open")))))


(provide 'init-tex)
