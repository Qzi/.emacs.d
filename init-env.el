;; author: qzi
;; email: i@qzier.com
;; content: environment

;; personal
(setq user-full-name "qzi")
(setq user-mail-address "i@qzier.com")

;; encoding
(set-language-environment "utf-8")

;; explicit font highlight setting
(global-font-lock-mode t)

;; show-paren-mode
(setq show-paren-delay 0
      show-paren-style 'parenthesis)
(show-paren-mode 1)

;; inhibit
(setq inhibit-startup-screen t)
(setq gnus-inhibit-startup-message t)
(setq initial-scratch-message "")

;; tab
(setq indent-tabs-mode nil) ;; 关闭默认
(setq tab-width 4) 
(default-value 'tab-width)
;; c自动缩进的宽度设置为4
(setq c-basic-offset 4)

;; 不生成#filename#
(setq auto-save-default nil)

;;关闭临时备份
(setq auto-save-default nil) 
(setq make-backup-files nil)

;; speedbar
;(autoload 'speedbar-frame-mode "speedbar" "Popup a speedbar frame" t)
;(autoload 'speedbar-get-focus "speedbar" "Jump to speedbar frame" t)
;;(global-set-key [(f5)] 'speedbar-get-focus)

;;(require 'sr-speedbar)
;;(global-set-key (kbd "s-s") 'sr-speedbar-toggle)  

;; recentf for history
;; ---------------------
(require 'recentf)
(recentf-mode 1)
(setq recentf-max-menu-items 25)
(global-set-key "\C-x\ \C-r" 'recentf-open-files)


;; sr-speedbar
;; ------------
;; deps: sr-speedbar.el
(add-to-list 'load-path "~/.emacs.d/plugins/sr-speedbar")
(require 'sr-speedbar)
(setq speedbar-show-unknown-files t)
(setq speedbar-use-images nil)
(setq sr-speedbar-width 30)
(setq sr-speedbar-right-side t)
(global-set-key (kbd "<f4>") 
		(lambda() (interactive)
		       (sr-speedbar-toggle)
		       (sr-speedbar-select-window)))

;; speedbar
;(autoload 'speedbar-frame-mode "speedbar" "Popup a speedbar frame" t)
;(autoload 'speedbar-get-focus "speedbar" "Jump to speedbar frame" t)
;;(global-set-key [(f4)] 'speedbar-get-focus)

;;(require 'sr-speedbar)


;; ecb 
;; -----
;; deps: ecb snapshot for emacs 2.4.2
(require 'ecb) ;; emacs 24.2 need ecb snapshot
;;(setq ecb-auto-activate t)    
(setq ecb-tip-of-the-day nil)
(setq stack-trace-on-error nil)
(setq ecb-options-version "2.40")

;;括号匹配
;;自动补全括号
(defun my-common-mode-auto-pair () 
(interactive) 
(make-local-variable 'skeleton-pair-alist) 
(setq skeleton-pair-alist '( 
(? ? _ "''")
(? ? _ """")
(? ? _ "()")
(? ? _ "[]")
(?{ \n > _ \n ?} >)))
(setq skeleton-pair t)
(local-set-key (kbd "(") 'skeleton-pair-insert-maybe) 
(local-set-key (kbd "\"") 'skeleton-pair-insert-maybe) 
(local-set-key (kbd "{") 'skeleton-pair-insert-maybe) 
(local-set-key (kbd "\'") 'skeleton-pair-insert-maybe) 
(local-set-key (kbd "[") 'skeleton-pair-insert-maybe)) 

(add-hook 'c-mode-hook 'my-common-mode-auto-pair) 
(add-hook 'c++-mode-hook 'my-common-mode-auto-pair) 

;; dired-x
(add-hook 'dired-load-hook
	  (lambda ()
	    (load "dired-x")
	    ))
(add-hook 'dired-mode-hook
	  (lambda ()
	    ))
(define-key global-map "\C-x\C-j" 'dired-jump)


(provide 'init-env)
