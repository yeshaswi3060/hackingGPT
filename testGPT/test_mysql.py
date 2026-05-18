import mysql.connector
import sys
try:
    cnx = mysql.connector.connect(host='89.116.133.111', user='root', password='')
    print('MySQL root with no password: SUCCESS')
    cnx.close()
except mysql.connector.Error as err:
    print('MySQL root with no password: FAILED -', err)
try:
    cnx = mysql.connector.connect(host='89.116.133.111', user='root', password='root')
    print('MySQL root:root: SUCCESS')
    cnx.close()
except mysql.connector.Error as err:
    print('MySQL root:root: FAILED -', err)
try:
    cnx = mysql.connector.connect(host='89.116.133.111', user='root', password='mysql')
    print('MySQL root:mysql: SUCCESS')
    cnx.close()
except mysql.connector.Error as err:
    print('MySQL root:mysql: FAILED -', err)
try:
    cnx = mysql.connector.connect(host='89.116.133.111', user='admin', password='admin')
    print('MySQL admin:admin: SUCCESS')
    cnx.close()
except mysql.connector.Error as err:
    print('MySQL admin:admin: FAILED -', err)