;; author: qzi
;; email: i@qzier.com
;; content: tex && latex


; XeLaTeX
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
