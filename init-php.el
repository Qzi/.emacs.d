;; author: qzi
;; emial: i@qzi.me
;; content: php

;; php-mode
;; from: https://github.com/ejmr/php-mode/wiki
;; path: .emacs.d/plugins/php-mode
(add-to-list 'load-path "~/.emacs.d/plugins/php-mode/")
(require 'php-mode)
(add-to-list 'auto-mode-alist
     	     '("\\.php[34]?\\'\\|\\.phtml\\'" . php-mode))


(provide 'init-php)
