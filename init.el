;; author: qzi
;; email: i@qzier.com
;; content: emacs setting
;; tips: elpa + customise(注释能用英文就英文，不会用英文或者赶时间就用中文)


;; load setting
(add-to-list 'load-path (expand-file-name "~/.emacs.d"))

;; require
(require 'init-repo) ;; loadpath
(require 'init-env)
(require 'init-ui)
(require 'init-utils)
(require 'init-yas-ac)
(require 'init-lisp)
(require 'init-html)
(require 'init-css)
(require 'init-js)
(require 'init-markdown)
(require 'init-tex)
(require 'init-c)  ;; after init-yas-ac
(require 'init-keymap) ;; keyboard map
(require 'init-postfix) ;; 放到大多数库的后面


;;; 下面功能正在验证中  ...
(custom-set-variables
 ;; custom-set-variables was added by Custom.
 ;; If you edit it by hand, you could mess it up, so be careful.
 ;; Your init file should contain only one such instance.
 ;; If there is more than one, they won't work right.
 '(custom-safe-themes (quote ("21d9280256d9d3cf79cbcf62c3e7f3f243209e6251b215aede5026e0c5ad853f" default)))
 '(default-frame-alist (quote ((nil . fullheight) (vertical-scroll-bars))))
 '(ecb-auto-update-methods-after-save t)
 '(ecb-directories-update-speedbar t)
 '(ecb-fix-window-size (quote width))
 '(ecb-layout-window-sizes nil)
 '(ecb-options-version "2.40")
 '(ecb-primary-secondary-mouse-buttons (quote mouse-1--mouse-2))
 '(ecb-source-path (quote (("~/.emacs.d" "_emacs.d") ("~/learning" "learning"))))
 '(send-mail-function (quote mailclient-send-it))
 '(speedbar-show-unknown-files t)
 '(speedbar-use-images nil))
(custom-set-faces
 ;; custom-set-faces was added by Custom.
 ;; If you edit it by hand, you could mess it up, so be careful.
 ;; Your init file should contain only one such instance.
 ;; If there is more than one, they won't work right.
 )



;; anything
;;(add-to-list 'load-path "~/.emacs.d/plugins/helm")
;;(require 'helm-config)
;;(helm-mode 1)
;;(global-set-key (kbd "C-c h") 'helm-mini)

