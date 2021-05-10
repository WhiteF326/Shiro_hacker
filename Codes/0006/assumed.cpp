#include <iostream>
#include <vector>
using namespace std;

int main(){
  int i, j; cin >> i >> j;
  for(int a = i; a <= j; a++){
    for(int b = i; b <= j; b++){
      for(int c = i; c <= j; c++){
        if(a != b && a != c && b != c){
          if(468 % (a * b * c) == 0 || (a * b * c) % 468 == 0){
            cout << a << " " << b << " " << c << endl;
            return 0;
          }
        }
      }
    }
  }
  cout << "Not Found" << endl;
}
