defmodule assumed do
  def main do
    a = IO.gets("") |> String.trim |> String.to_integer
    IO.puts rem(468, a)
  end
end
