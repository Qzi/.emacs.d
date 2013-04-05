;; author: qzi
;; email: i@qzier.com
;; content: utils

;;;复制一行或者多行
;;；C-c C-l 复制整行, 而"C-u 5 C-c C-l"复制 5 行
(defun copy-lines(&optional arg)
  (interactive "p") ;; (interactive "prompt-string")
  (save-excursion
    (beginning-of-line)
    (set-mark (point)) ;; point return value of point, as an integer
    (next-line arg)
    (kill-ring-save (mark) (point)) ;; yank (BEG END) into kill ring
    )
  )

;;(global-set-key (kbd "C-c l") 'copy-lines)


;; fullscreen
;; -----------
(defun toggle-fullscreen (&optional f)
  (interactive)
  (let ((current-value (frame-parameter nil 'fullscreen)))
    (set-frame-parameter nil 'fullscreen
			 (if (equal 'fullboth current-value)
			     (if (boundp 'old-fullscreen) old-fullscreen nil)
			   (progn (setq old-fullscreen current-value)
				  'fullboth)))))

;; maximized
;; ----------
(defun toggle-maximized (&optional f)
  (interactive)
  (let ((current-value (frame-parameter nil 'fullscreen)))
    (set-frame-parameter nil 'fullscreen
			 (if (equal 'maximized current-value)
			     (if (boundp 'old-fullscreen) old-fullscreen nil)
			   (progn (setq old-fullscreen current-value)
				  'maximized)))))


;; 自动补全括号
;; -----------
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

;; js-mode-auto-pair
(defun my-js-mode-auto-pair () 
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
;;  (local-set-key (kbd "{") 'skeleton-pair-insert-maybe) 
  (local-set-key (kbd "\'") 'skeleton-pair-insert-maybe) 
  (local-set-key (kbd "[") 'skeleton-pair-insert-maybe))

;; lisp-mode-auto-pair
(defun my-lisp-mode-auto-pair () 
  (interactive) 
  (make-local-variable 'skeleton-pair-alist) 
  (setq skeleton-pair-alist '( 
			      (? ? _ "''")
			      (? ? _ """")
			      (? ? _ "()")
			      (?{ \n > _ \n ?} >)))
  (setq skeleton-pair t)
  (local-set-key (kbd "(") 'skeleton-pair-insert-maybe) 
  (local-set-key (kbd "\"") 'skeleton-pair-insert-maybe))


;; 用"%"在匹配的括号之间来回跳转
(defun match-paren (arg)
  "Go to the matching paren if on a paren; otherwise insert %."
  (interactive "p")
  (cond ((looking-at "\\s\(") (forward-list 1) (backward-char 1))
	((looking-at "\\s\)") (forward-char 1) (backward-list 1))
	(t (self-insert-command (or arg 1)))))


(defun runjs()
  "run js/执行当前缓冲区的js程序"
  (interactive)
  ;;(save-buffer)
  (let ((filename buffer-file-name)
	(cmd "")
	(oldbuf (current-buffer))
	(end (point-max)))
    (if filename
	(save-buffer)
      (save-excursion
	(setq filename (concat (getenv "tmp") "/temp.js"))
	(set-buffer (create-file-buffer filename))
	(insert-buffer-substring oldbuf 1 end)
	(write-file filename)
	(kill-buffer (current-buffer))))
    (setq cmd (concat "node " filename))  ;; node the run command
    (message "%s  ..." cmd)
    (shell-command cmd)))


(provide 'init-utils)
