;;(load-file "D:/Portable/emacs/.emacs")

(setenv "HOME" "D:/Portable/emacs/")
(setenv "PATH" "D:/Portable/emacs/")
;;set the default file path
(setq default-directory "~/")
(add-to-list 'load-path "~/.emacs.d/site-lisp")

(custom-set-variables
 ;; custom-set-variables was added by Custom.
 ;; If you edit it by hand, you could mess it up, so be careful.
 ;; Your init file should contain only one such instance.
 ;; If there is more than one, they won't work right.
 '(custom-enabled-themes (quote (wombat)))
 '(inhibit-startup-screen t)
 '(initial-scratch-message nil)
 '(tool-bar-mode nil))
(custom-set-faces
 ;; custom-set-faces was added by Custom.
 ;; If you edit it by hand, you could mess it up, so be careful.
 ;; Your init file should contain only one such instance.
 ;; If there is more than one, they won't work right.
 )
