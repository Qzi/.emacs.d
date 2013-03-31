;; author: qzi
;; email: i@qzier.com
;; content: css

;; ac for css
(defun my-ac-css-mode-setup ()
  (setq ac-sources (append '(ac-source-css-property) ac-sources)))
(add-hook 'css-mode-hook 'my-ac-css-mode-setup)


(provide 'init-css)
