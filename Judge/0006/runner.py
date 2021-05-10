i, j = map(int, input().split())
expected = input()
d = input()
ans = True
if d != "Not Found":
    a, b, c = map(int, d.split())
    if a > j or a < i:
        ans = False
    if b > j or b < i:
        ans = False
    if c > j or c < i:
        ans = False
    if 468 % (a * b * c) != 0 and (a * b * c) % 468 != 0:
        ans = False
else:
    if expected != d:
        ans = False
if ans:
    print("AC")
else:
    print("WA")