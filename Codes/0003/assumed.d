import std.stdio, std.string, std.conv;

void main(){
    auto a = readln.chomp.to!int;
    writefln("%d", 468 % a);
}