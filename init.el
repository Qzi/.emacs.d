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
(require 'init-yas-ac) ;; 要放在大部分语言设置之前，因为有些有添加ac-sources...etc.
(require 'init-lisp)
(require 'init-html)
(require 'init-css)
(require 'init-js)
(require 'init-markdown)
(require 'init-tex)
(require 'init-c)  ;; after init-yas-ac
(require 'init-php)
(require 'init-vcs)
(require 'init-keymap) ;; keyboard map
(require 'init-postfix) ;; 放到大多数库的后面




;;; 下面功能正在验证中  ...
(custom-set-variables
 ;; custom-set-variables was added by Custom.
 ;; If you edit it by hand, you could mess it up, so be careful.
 ;; Your init file should contain only one such instance.
 ;; If there is more than one, they won't work right.
 '(ansi-color-names-vector ["#2e3436" "#a40000" "#4e9a06" "#c4a000" "#204a87" "#5c3566" "#729fcf" "#eeeeec"])
 '(blink-cursor-mode nil)
 '(column-number-mode t)
 '(cua-mode t nil (cua-base))
 '(custom-enabled-themes (quote (adwaita)))
 '(custom-safe-themes (quote ("21d9280256d9d3cf79cbcf62c3e7f3f243209e6251b215aede5026e0c5ad853f" default)))
 '(debug-on-error t)
 '(default-frame-alist (quote ((nil . fullheight) (vertical-scroll-bars))))
 '(ecb-auto-update-methods-after-save t)
 '(ecb-directories-update-speedbar t)
 '(ecb-fix-window-size (quote width))
 '(ecb-layout-window-sizes nil)
 '(ecb-options-version "2.40")
 '(ecb-primary-secondary-mouse-buttons (quote mouse-1--mouse-2))
 '(ecb-source-path (quote (("~/.emacs.d" "_emacs.d") ("~/learning" "learning"))))
 '(fringe-mode 0 nil (fringe))
 '(indicate-buffer-boundaries (quote left))
 '(indicate-empty-lines t)
 '(initial-buffer-choice nil)
 '(initial-scratch-message nil)
 '(js2-basic-offset 4)
 '(js2-mode-show-strict-warnings nil)
 '(overflow-newline-into-fringe t)
 '(save-place t nil (saveplace))
 '(semantic-default-submodes (quote (global-semantic-decoration-mode global-semantic-idle-local-symbol-highlight-mode global-semantic-idle-completions-mode global-semantic-show-unmatched-syntax-mode global-semantic-idle-scheduler-mode global-semanticdb-minor-mode global-semanticdb-minor-mode global-semantic-highlight-func-mode global-semantic-highlight-edits-mode global-semantic-stickyfunc-mode-hook global-semantic-idle-summary-mode global-semantic-mru-bookmark-mode)))
 '(semantic-idle-scheduler-idle-time 3)
 '(send-mail-function (quote mailclient-send-it))
 '(show-paren-mode t)
 '(size-indication-mode t)
 '(speedbar-show-unknown-files t)
 '(speedbar-use-images nil)
 '(text-mode-hook (quote (turn-on-auto-fill text-mode-hook-identify)))
 '(tool-bar-mode nil)
 '(tooltip-mode nil)
 '(uniquify-buffer-name-style (quote forward) nil (uniquify)))
(custom-set-faces
 ;; custom-set-faces was added by Custom.
 ;; If you edit it by hand, you could mess it up, so be careful.
 ;; Your init file should contain only one such instance.
 ;; If there is more than one, they won't work right.
 )



(add-to-list 'tramp-default-proxies-alist
             '(nil "\\`user\\'" "/ssh:%h:"))
(setq tramp-default-method "ssh")
