;; author: qzi
;; email: i@qzier.com
;; content: emacs setting
;; tips: elpa + customise(注释能用英文就英文，不会用英文或者赶时间就用中文)


;; load setting
(add-to-list 'load-path (expand-file-name "~/.emacs.d"))

;; require
(require 'init-repo)
(require 'init-env)
(require 'init-ui)
(require 'init-yas-ac)
(require 'init-utils)
(require 'init-lisp)
(require 'init-html)
(require 'init-js)
(require 'init-markdown)
(require 'init-keymap) ;; key map
(require 'init-postfix) ;; 放到大多数库的后面

(require 'cedet)
(global-ede-mode t)

;; 下面功能正在验证中  ...
(custom-set-variables
 ;; custom-set-variables was added by Custom.
 ;; If you edit it by hand, you could mess it up, so be careful.
 ;; Your init file should contain only one such instance.
 ;; If there is more than one, they won't work right.
 '(ecb-auto-update-methods-after-save t)
 '(ecb-fix-window-size (quote width))
 '(ecb-layout-window-sizes (quote (("left8" (ecb-directories-buffer-name 0.22 . 0.26666666666666666) (ecb-sources-buffer-name 0.22 . 0.23333333333333334) (ecb-methods-buffer-name 0.22 . 0.3) (ecb-history-buffer-name 0.22 . 0.16666666666666666)))))
 '(ecb-options-version "2.40")
 '(ecb-primary-secondary-mouse-buttons (quote mouse-1--mouse-2))
 '(ecb-source-path (quote (("/Users/z/.emacs.d" "_emacs.d")))))
(custom-set-faces
 ;; custom-set-faces was added by Custom.
 ;; If you edit it by hand, you could mess it up, so be careful.
 ;; Your init file should contain only one such instance.
 ;; If there is more than one, they won't work right.
 )
