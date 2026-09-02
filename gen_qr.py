#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
问卷二维码生成工具
用法：
  python3 gen_qr.py <问卷URL>
示例：
  python3 gen_qr.py https://your-app.onrender.com/
生成：public/qr.png（覆盖旧图）
"""
import sys
import qrcode
from qrcode.constants import ERROR_CORRECT_M

def main():
    if len(sys.argv) < 2:
        print('用法: python3 gen_qr.py <问卷URL>')
        print('示例: python3 gen_qr.py https://your-app.onrender.com/')
        sys.exit(1)
    url = sys.argv[1].strip()
    qr = qrcode.QRCode(version=4, error_correction=ERROR_CORRECT_M, box_size=10, border=4)
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color='#1a2333', back_color='white')
    img.save('public/qr.png')
    print(f'✅ 二维码已生成: public/qr.png  (指向 {url})')
    print('  将该图片发给学生扫码即可填写问卷。')

if __name__ == '__main__':
    main()
