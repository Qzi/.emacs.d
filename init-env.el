;; author: qzi
;; email: i@qzier.com
;; content: environment

;; personal
(setq user-full-name "qzi")
(setq user-mail-address "i@qzier.com")

;; encoding
(set-language-environment 'utf-8)
(set-terminal-coding-system 'utf-8)
(set-keyboard-coding-system 'utf-8)

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

;; ido-mode
(ido-mode t)

;; fring-mode
(set-fringe-style -1)

;; 如果没有将其设置为 nil，那么 Emacs 将使得该框架闪烁，而不是鸣响系统警铃。
(setq visible-bell t)

;; Enable CUA selection mode without the C-z/C-x/C-c/C-v bindings.
(cua-selection-mode t)

;; selection mode
;;(delete-selection-mode t)

;; 不生成#filename#
(setq auto-save-default nil) 
(setq make-backup-files nil)

;; 关闭大小写
;;(put 'upcase-region 'disabled nil)
;;(put 'downcase-region 'disabled nil)

;; speedbar
;(autoload 'speedbar-frame-mode "speedbar" "Popup a speedbar frame" t)
;(autoload 'speedbar-get-focus "speedbar" "Jump to speedbar frame" t)
;;(global-set-key [(f5)] 'speedbar-get-focus)
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
(setq sr-speedbar-width 25)
(setq sr-speedbar-right-side t)
(global-set-key (kbd "<f4>") 
		(lambda() (interactive)
		       (sr-speedbar-toggle)
		       (sr-speedbar-select-window)))


;; ecb 
;; -----
;; deps: ecb snapshot for emacs 2.4.2
;;(require 'ecb) ;; emacs 24.2 need ecb snapshot
;;(setq ecb-auto-activate t)    
;;(setq ecb-tip-of-the-day nil)
;;(setq stack-trace-on-error nil)
;;(setq ecb-options-version "2.40")


;;括号匹配
(add-hook 'c-mode-hook 'my-common-mode-auto-pair) 
(add-hook 'c++-mode-hook 'my-common-mode-auto-pair) 
(add-hook 'lisp-mode-hook 'my-lisp-mode-auto-pair)
(add-hook 'emacs-lisp-mode 'my-lisp-mode-auto-pair)
(add-hook 'lisp-interaction-mode-hook 'my-lisp-mode-auto-pair)
(add-hook 'js2-mode-hook 'my-js-mode-auto-pair)


;; dired-x
(add-hook 'dired-load-hook
	  (lambda ()
	    (load "dired-x")
	    ))
(add-hook 'dired-mode-hook
	  (lambda ()
	    ))
(define-key global-map "\C-x\C-j" 'dired-jump)


;; shell
(defalias 'emacs 'find-file)
(defalias 'emacso 'find-file-other-window)


;; abbrev
;; -------
(abbrev-mode t)
(setq abbrev-file-name             ;; tell emacs where to read abbrev
        "~/.emacs.d/abbrev_defs")    ;; definitions from...
(setq save-abbrevs t)              ;; save abbrevs when files are saved
;; reads the abbreviations file on startup
;Avoid errors if the abbrev-file is missing
(if (file-exists-p abbrev-file-name)
        (quietly-read-abbrev-file))


;; fill-column
;; ------------
(setq fill-column 80)


;; modename: desctop
;; desc:  退出保存打开文件和buffer
;; ----------------
(load "desktop") 
(desktop-load-default)
(desktop-read)
(desktop-save-mode 1)
(setq desktop-restore-eager 2)
(setq desktop-path '("~/.emacs.d/"))
(setq desktop-dirname "~/.emacs.d/")
(setq desktop-base-file-name ".emacs.desktop")


(provide 'init-env)
