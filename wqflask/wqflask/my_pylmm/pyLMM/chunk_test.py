from __future__ import absolute_import, print_function, division

import math
import time
import collections

"""
558 exact out of 1000    [Total amount off: 1580]
"""



def zach_divide_into_chunks(the_list, number_chunks):
    length = len(the_list)
    if length == 0:
        return [[]]

    if number_chunks > length:
        number_chunks = length

    chunksize = int(math.ceil(length / number_chunks))
    #if length % number_chunks > 0:
    #    chunksize += 1
    #    while (chunksize * number_chunks) > length:
    #        number_chunks -= 1

    chunks = []
    for counter in range(0, length, chunksize):
        chunks.append(the_list[counter:counter+chunksize])

    return chunks


def sam_divide_into_chunks(the_list, number_chunks):
    length = len(the_list)

    if length == 0:
        return [[]]
    else:
        if length <= number_chunks:
            number_chunks = length

        chunksize = int(math.ceil(length / number_chunks))

        chunks = []
        for counter in range(0, length, chunksize):
            chunks.append(the_list[counter:counter+chunksize])

    return chunks

def confirm_chunk(original, result):
    all_chunked = []
    for chunk in result:
        all_chunked.extend(chunk)
    print("length of all chunked:", len(all_chunked))
    assert original == all_chunked, "You didn't chunk right"


def chunk_test(divide_func):
    import random
    random.seed(7)

    number_exact = 0
    total_amount_off = 0

    for test in range(1, 1001):
        print("\n\ntest:", test)
        number_chunks = random.randint(1, 20)
        number_elements = random.randint(0, 100)
        the_list = list(range(1, number_elements))
        result = divide_func(the_list, number_chunks)

        print("Dividing list of length {} into approximately {} chunks - got {} chunks".format(
            len(the_list), number_chunks, len(result)))
        print("result:", result)

        confirm_chunk(the_list, result)

        amount_off = abs(number_chunks - len(result))
        if amount_off == 0:
            number_exact += 1
        else:
            total_amount_off += amount_off


        print("\n{} exact out of {}    [Total amount off: {}]".format(number_exact,
                                                                      test,
                                                                      total_amount_off))

    return number_exact, total_amount_off


def main():
    info = dict()
    funcs = (("sam", sam_divide_into_chunks), ("zach", zach_divide_into_chunks))
    for name, func in funcs:
        start = time.time()
        number_exact, total_amount_off = chunk_test(func)
        took = time.time() - start
        info[name] = dict(number_exact=number_exact,
                          total_amount_off=total_amount_off,
                          took=took)

    print("info is:", info)

if __name__ == '__main__':
    main()