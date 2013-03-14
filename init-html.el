;;; author: qzi
;; email: i@qzier.com
;; content: html


;; zencoding
(add-to-list 'load-path "~/.emacs.d/elpa/zencoding-mode-0.5.1")
(require 'zencoding-mode)
(add-hook 'sgml-mode-hook 'zencoding-mode)

(provide 'init-html)
